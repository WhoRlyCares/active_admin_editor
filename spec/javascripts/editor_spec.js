//= require spec_helper
//= require support/mock_wysihtml5
//= require active_admin/editor/editor

describe('Editor', function() {
  beforeEach(function() {
    this.xhr = sinon.useFakeXMLHttpRequest()
    $('body').append(JST['templates/editor']())
    this.config = sinon.stub()
    this.editor = new window.Editor($('.html_editor')[0], this.config)
  })

  afterEach(function() {
    this.xhr.restore()
  })

  it('sets .$el', function() {
    expect(this.editor.$el).to.exist
  })

  it('sets .$textarea', function() {
    expect(this.editor.$textarea).to.exist
  })

  it('sets .$toolbar', function() {
    expect(this.editor.$toolbar).to.exist
  })

  it('sets .policy', function() {
    expect(this.editor.policy.document).to.eq('policy document')
  })

  it('sets .signature', function() {
    expect(this.editor.policy.signature).to.eq('policy signature')
  })

  it('attaches wysihtml5', function() {
    expect(wysihtml5.Editor).to.have.been.calledWith('page_content')
  })

  describe('.uploading', function() {
    describe('when set to true', function() {
      beforeEach(function() {
        this.uploading = this.editor.uploading(true)
      })

      it('returns true', function() {
        expect(this.uploading).to.be.true
      })

      it('sets ._uploading', function() {
        expect(this.editor._uploading).to.be.true
      })

      it('adds the .uploading class', function() {
        expect(this.editor.$el).to.have.class('uploading')
      })
    })

    describe('when set to false', function() {
      beforeEach(function() {
        this.uploading = this.editor.uploading(false)
      })

      it('returns false', function() {
        expect(this.uploading).to.be.false
      })

      it('sets ._uploading', function() {
        expect(this.editor._uploading).to.be.false
      })

      it('adds the .uploading class', function() {
        expect(this.editor.$el).to.not.have.class('uploading')
      })
    })
  })

  describe('.upload', function() {
    beforeEach(function() {
      this.xhr.prototype.upload = { addEventListener: sinon.stub() }
    })

    it('returns an XMLHttpRequest', function() {
      expect(this.editor.upload(sinon.stub(), function() {})).to.be(XMLHttpRequest)
    })

    it('opens the connection to the proper bucket', function() {
      this.xhr.prototype.open = sinon.stub()
      this.xhr.prototype.send = sinon.stub()
      this.config.s3_bucket = 'bucket'
      xhr = this.editor.upload(sinon.stub(), function() {})
      expect(xhr.open).to.have.been.calledWith('POST', 'https://bucket.s3.amazonaws.com', true)
    })

    it('sends the request', function() {
      this.xhr.prototype.send = sinon.stub()
      xhr = this.editor.upload(sinon.stub(), function() {})
      expect(xhr.send).to.have.been.called
    })

    describe('form data', function() {
      beforeEach(function() {
        file = this.file = { name: 'foobar', type: 'image/jpg' }
        append = this.append = sinon.stub()
        FormData = function() { return { append: append } }

        Date.now = function() { return { toString: function() { return '1234' } } }

        this.xhr.prototype.open = sinon.stub()
        this.xhr.prototype.send = sinon.stub()

        this.config.s3_bucket         = 'bucket'
        this.config.storage_dir       = 'uploads'
        this.config.aws_access_key_id = 'access key'

        this.editor.upload(file, function() {})
      })

      it('sets "key"', function() {
        expect(this.append).to.have.been.calledWith('key', 'uploads/1234-foobar')
      })

      it('sets "AWSAccessKeyId"', function() {
        expect(this.append).to.have.been.calledWith('AWSAccessKeyId', 'access key')
      })

      it('sets "acl"', function() {
        expect(this.append).to.have.been.calledWith('acl', 'public-read')
      })

      it('sets "policy"', function() {
        expect(this.append).to.have.been.calledWith('policy', 'policy document')
      })

      it('sets "signature"', function() {
        expect(this.append).to.have.been.calledWith('signature', 'policy signature')
      })

      it('sets "Content-Type"', function() {
        expect(this.append).to.have.been.calledWith('Content-Type', 'image/jpg')
      })

      it('sets "file"', function() {
        expect(this.append).to.have.been.calledWith('file', this.file)
      })
    })
  })
})